package io.beaconate.labs.objbbepoc;

import io.beaconate.labs.objbbepoc.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "beaconendpoint", namespace = @ApiNamespace(ownerDomain = "beaconate.io", ownerName = "beaconate.io", packagePath = "labs.objbbepoc"))
public class BeaconEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listBeacon")
	public CollectionResponse<Beacon> listBeacon(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Beacon> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Beacon.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Beacon>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Beacon obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Beacon> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getBeacon")
	public Beacon getBeacon(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Beacon beacon = null;
		try {
			beacon = mgr.getObjectById(Beacon.class, id);
		} finally {
			mgr.close();
		}
		return beacon;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param beacon the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertBeacon")
	public Beacon insertBeacon(Beacon beacon) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (beacon.getId() != null) {
				if (containsBeacon(beacon)) {
					throw new EntityExistsException("Object already exists");
				}
			}
			mgr.makePersistent(beacon);
		} finally {
			mgr.close();
		}
		return beacon;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param beacon the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateBeacon")
	public Beacon updateBeacon(Beacon beacon) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsBeacon(beacon)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(beacon);
		} finally {
			mgr.close();
		}
		return beacon;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeBeacon")
	public void removeBeacon(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Beacon beacon = mgr.getObjectById(Beacon.class, id);
			mgr.deletePersistent(beacon);
		} finally {
			mgr.close();
		}
	}

	private boolean containsBeacon(Beacon beacon) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Beacon.class, beacon.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
